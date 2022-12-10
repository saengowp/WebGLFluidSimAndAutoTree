uniform sampler2D previous;
uniform vec2 screenSize;
uniform bool boyance;
uniform vec2 wind;
uniform float dt;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;
    
    gl_FragColor = texture2D(previous, relCord);
    gl_FragColor.g += wind.x * dt;
    gl_FragColor.b += wind.y * dt;
    if (boyance) {
        gl_FragColor.b += 10.0 * gl_FragColor.r * dt;
    }
}