function determineUsernamePlacing(username) {
    if (username.startsWith("[Guest] ")) username = username.slice("[Guest] ".length);

    const pos_x = 12.5 * game.scale,
          pos_y = -4 * game.scale;
        
    textAlign(CENTER);
    text(username, pos_x, pos_y);
}