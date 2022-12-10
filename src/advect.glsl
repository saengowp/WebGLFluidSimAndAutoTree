uniform sampler2D previous;
uniform vec2 screenSize;
uniform float dt;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;

    vec4 cen = texture2D(previous, relCord);
    vec2 prevLoc = relCord - unitDist * cen.yz * dt;

    gl_FragColor = texture2D(previous, prevLoc);
    if (prevLoc.x < 0.0 || prevLoc.x > 1.0 || prevLoc.y < 0.0 || prevLoc.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } 
}