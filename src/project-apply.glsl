uniform sampler2D previous;
uniform vec2 screenSize;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;
    
    float h = 1.0/min(screenSize.x, screenSize.y);
    vec4 cen = texture2D(previous, relCord);
    float p = cen.w;

    gl_FragColor = cen;
    gl_FragColor.g -= 0.5*(texture2D(previous, relCord + vec2(unitDist.x, 0.0)).w - texture2D(previous, relCord - vec2(unitDist.x, 0.0)).w)/h;
    gl_FragColor.b -= 0.5*(texture2D(previous, relCord + vec2(0.0, unitDist.y)).w - texture2D(previous, relCord - vec2(0.0, unitDist.y)).w)/h;
}