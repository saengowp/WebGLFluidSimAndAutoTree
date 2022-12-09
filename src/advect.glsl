uniform sampler2D previous;
uniform vec2 screenSize;
uniform float dt;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;

    vec4 cen = texture2D(previous, relCord);
    vec2 prevLoc = relCord - unitDist * vec2(0.0, 100.0) * dt;

    gl_FragColor = cen;
    gl_FragColor.r = texture2D(previous, prevLoc).r;
    if (prevLoc.x < 0.0 || prevLoc.x > 1.0 || prevLoc.y < 0.0 || prevLoc.y > 1.0) {
        gl_FragColor.r = 0.0;
    } 

}