uniform sampler2D previous;
uniform vec2 screenSize;
uniform int ch;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;
    
    if (ch == 0)
        gl_FragColor = texture2D(previous, relCord).r *vec4(1.0, 1.0, 1.0, 1.0);
    else if (ch == 1)
        gl_FragColor = texture2D(previous, relCord).g *vec4(1.0, 1.0, 1.0, 1.0);
    else if (ch == 2)
        gl_FragColor = texture2D(previous, relCord).b *vec4(1.0, 1.0, 1.0, 1.0);
    else if (ch == 3)
        gl_FragColor = texture2D(previous, relCord).a *vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor.a = 1.0;
}