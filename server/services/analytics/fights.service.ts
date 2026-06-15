export function computeFights(events: any) {
  const summary = {
    totalEvents: events.length,
    weaponFires: 0,
    kills: 0,
    playerHurts: 0,
    rounds: 0,
  };

  const playerShots: Record<string, number> = {};

  for (const event of events) {
    switch (event.name) {
      case "WeaponFire":
        summary.weaponFires++;

        if (event.player) {
          playerShots[event.player] = (playerShots[event.player] || 0) + 1;
        }
        break;

      case "Kill":
        summary.kills++;
        break;

      case "PlayerHurt":
        summary.playerHurts++;
        break;

      case "RoundStart":
        summary.rounds++;
        break;
    }
  }

  return {
    summary,
    topPlayers: Object.entries(playerShots)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, shots]) => ({
        name,
        shots,
      })),
  };
}
