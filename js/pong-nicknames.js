/* Session-only match nicknames: pick two words from the player's style pool.
   Travel is measured in court heights, making profiles independent of screen size. */
(() => {
  const words = {
    quiet: [['Quiet','Still'], ['Observer','Watcher']],
    chasing: [['Active','Restless'], ['Chaser','Mover']],
    angled: [['Angled','Edge'], ['Striker','Returner']],
    steady: [['Long-rally','Extended-rally'], ['Returner','Rallier']],
    rally: [['Short-rally','Rally'], ['Builder','Returner']],
    occasional: [['Occasional','Sporadic'], ['Returner','Hitter']],
    starting: [['Moving','Roaming'], ['Player','Challenger']]
  };
  globalThis.PixelPongNickname = (stats, previous = '', random = Math.random) => {
    // Require multiple returns before inferring technique or consistency.
    // Paddle movement alone never earns a return/rally label; names describe
    // observed actions, without claiming learning, improvement or defensive skill.
    const style = stats.returns === 0 && stats.travel < .2 ? 'quiet'
      : stats.returns >= 3 && stats.angled / stats.returns >= 2/3 ? 'angled'
      : stats.returns >= 4 && stats.longest >= 8 ? 'steady'
      : stats.travel / Math.max(stats.seconds, 1) > .45 ? 'chasing'
      : stats.returns >= 2 && stats.longest >= 4 ? 'rally'
      : stats.returns >= 1 ? 'occasional' : 'starting';
    const [adjectives,nouns] = words[style];
    const adjective = adjectives[Math.floor(random()*adjectives.length)];
    let index = Math.floor(random()*nouns.length);
    if (`${adjective} ${nouns[index]}` === previous) index = (index+1)%nouns.length;
    return `${adjective} ${nouns[index]}`;
  };
})();
