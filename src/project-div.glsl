uniform sampler2D previous;
uniform vec2 screenSize;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;
    
    float h = 1.0/min(screenSize.x, screenSize.y);
    float div = -0.5 * h * (
        texture2D(previous, relCord + vec2(unitDist.x, 0.0)).g
        - texture2D(previous, relCord - vec2(unitDist.x, 0.0)).g
        + texture2D(previous, relCord + vec2(0.0, unitDist.y)).b
        - texture2D(previous, relCord - vec2(0.0, unitDist.y)).b
    );

    gl_FragColor.x = div;
}