uniform sampler2D previous;
uniform vec2 screenSize;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;

    vec4 left = texture2D(previous, vec2(relCord.x - unitDist.x, relCord.y)),
        right = texture2D(previous, vec2(relCord.x + unitDist.x, relCord.y)),
        up = texture2D(previous, vec2(relCord.x , relCord.y + unitDist.y)),
        down = texture2D(previous, vec2(relCord.x , relCord.y - unitDist.y)),
        cen = texture2D(previous, relCord);
    
    gl_FragColor = cen;
    gl_FragColor.r += 0.254*(left.r + right.r + up.r + down.r - 4.0*cen.r);

    if (distance(gl_FragCoord.xy, screenSize.xy/2.0) < 15.0) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}