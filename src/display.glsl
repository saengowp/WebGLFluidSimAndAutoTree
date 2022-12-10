uniform sampler2D previous;
uniform vec2 screenSize;
uniform int ch;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;
    
    float val;
    if (ch == 0)
        val = texture2D(previous, relCord).r;
    else if (ch == 1)
        val = texture2D(previous, relCord).g;
    else if (ch == 2)
        val = texture2D(previous, relCord).b;
    else if (ch == 3)
        val = texture2D(previous, relCord).a;
    
    vec4 cA = vec4(1.0, 1.0, 1.0, 1.0), cB = vec4(1.0*0.8, 0.22*0.8, 1.0*0.8, 1.0), cC = vec4(0.0, 0.0, 0.0, 1.0);
    if (val > 0.5) {
        gl_FragColor = (val - 0.5)*2.0 * cA + (1.0 - (val - 0.5)*2.0) *cB;
    } else {
        gl_FragColor = val*2.0 * cB + (1.0 - val*2.0) * cC;
    }
}