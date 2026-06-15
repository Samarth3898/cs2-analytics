package main

import (
	"encoding/json"
	"fmt"
	"os"

	dem "github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs"
	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/common"
	"github.com/markus-wa/demoinfocs-golang/v4/pkg/demoinfocs/events"
)

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

type View struct {
	Yaw   float64 `json:"yaw"`
	Pitch float64 `json:"pitch"`
}

type EventInfo struct {
	Name     string                 `json:"name"`
	Tick     int                    `json:"tick"`
	Player   string                 `json:"player,omitempty"`
	Team     string                 `json:"team,omitempty"`
	Position *Position              `json:"position,omitempty"`
	View     *View                  `json:"view,omitempty"`
	Data     map[string]interface{} `json:"data,omitempty"`
}

type PlayerStats struct {
	Kills  int `json:"kills"`
	Deaths int `json:"deaths"`
	Damage int `json:"damage"`
}

type Response struct {
	Stats  map[string]*PlayerStats `json:"stats"`
	Events []EventInfo             `json:"events"`
}

// 🔒 safe helper
func safePlayerName(p *common.Player) string {
	if p == nil {
		return ""
	}
	return p.Name
}

func extractPlayerData(p *common.Player) (string, string, *Position, *View) {
	if p == nil {
		return "", "", nil, nil
	}

	pos := p.Position()

	return p.Name,
		teamToString(p.Team),
		&Position{X: pos.X, Y: pos.Y, Z: pos.Z},
		&View{
			Yaw:   float64(p.ViewDirectionX()),
			Pitch: float64(p.ViewDirectionY()),
		}

}

func teamToString(team common.Team) string {
	switch team {
	case common.TeamTerrorists:
		return "T"
	case common.TeamCounterTerrorists:
		return "CT"
	case common.TeamSpectators:
		return "Spectator"
	default:
		return "Unknown"
	}
}

func main() {
	fmt.Println("Args:", os.Args)

	if len(os.Args) < 2 {
		fmt.Println("No demo file provided")
		return
	}

	f, err := os.Open(os.Args[1])
	if err != nil {
		panic(err)
	}
	defer f.Close()

	p := dem.NewParser(f)
	defer p.Close()

	stats := make(map[string]*PlayerStats)
	var eventsList []EventInfo

	seenEvents := make(map[string]bool)

	p.RegisterEventHandler(func(e any) {
		tick := p.GameState().IngameTick()

		switch ev := e.(type) {

		case events.WeaponFire:
			playerName, team, pos, view := extractPlayerData(ev.Shooter)

			eventsList = append(eventsList, EventInfo{
				Name:     "WeaponFire",
				Tick:     tick,
				Player:   playerName,
				Team:     team,
				Position: pos,
				View:     view,
				Data: map[string]interface{}{
					"weapon": ev.Weapon.String(),
				},
			})

		case events.PlayerHurt:
			attackerName, team, pos, view := extractPlayerData(ev.Attacker)

			eventsList = append(eventsList, EventInfo{
				Name:     "PlayerHurt",
				Tick:     tick,
				Player:   attackerName,
				Team:     team,
				Position: pos,
				View:     view,
				Data: map[string]interface{}{
					"victim": ev.Player.Name,
					"damage": ev.HealthDamage,
				},
			})

		case events.Kill:
			killerName, team, pos, view := extractPlayerData(ev.Killer)

			eventsList = append(eventsList, EventInfo{
				Name:     "Kill",
				Tick:     tick,
				Player:   killerName,
				Team:     team,
				Position: pos,
				View:     view,
				Data: map[string]interface{}{
					"victim":   safePlayerName(ev.Victim),
					"weapon":   ev.Weapon.String(),
					"headshot": ev.IsHeadshot,
				},
			})

		case events.RoundStart:
			eventsList = append(eventsList, EventInfo{
				Name: "RoundStart",
				Tick: tick,
			})

		case events.RoundEnd:
			eventsList = append(eventsList, EventInfo{
				Name: "RoundEnd",
				Tick: tick,
				Data: map[string]interface{}{
					"winner": teamToString(ev.Winner),
				},
			})

		case events.PlayerSpottersChanged:

			target := ev.Spotted

			spotters := p.GameState().Participants().SpottersOf(target)

			for _, s := range spotters {
				if s == nil {
					continue
				}

				playerName, team, pos, view := extractPlayerData(s)

				eventsList = append(eventsList, EventInfo{
					Name:     "PlayerSpotted",
					Tick:     tick,
					Player:   playerName,
					Team:     team,
					Position: pos,
					View:     view,
					Data: map[string]interface{}{
						"target": target.Name,
					},
				})
			}
		}

		eventType := fmt.Sprintf("%T", e)

		// only capture ONE of each type
		if seenEvents[eventType] {
			return
		}
		seenEvents[eventType] = true

	})
	// 🚀 Run parser
	err = p.ParseToEnd()
	if err != nil {
		panic(err)
	}

	// 📤 Final response
	response := Response{
		Stats:  stats,
		Events: eventsList,
	}

	outputFile := os.Args[2]

	file, err := os.Create(outputFile)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")

	err = encoder.Encode(response)
	if err != nil {
		panic(err)
	}
}
