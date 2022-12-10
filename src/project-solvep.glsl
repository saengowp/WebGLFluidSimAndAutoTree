uniform sampler2D previous;
uniform sampler2D div;
uniform vec2 screenSize;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;
    
    float h = 1.0/min(screenSize.x, screenSize.y);
    vec4 cen = texture2D(previous, relCord);

    float p = texture2D(div, relCord).x 
    + texture2D(previous, relCord + vec2(unitDist.x, 0.0)).w
    + texture2D(previous, relCord - vec2(unitDist.x, 0.0)).w
    + texture2D(previous, relCord + vec2(0.0, unitDist.y)).w
    + texture2D(previous, relCord - vec2(0.0, unitDist.y)).w;

    p /= 4.0;

    gl_FragColor = cen;
    gl_FragColor.w = p;
}