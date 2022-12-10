uniform sampler2D previous;
uniform vec2 screenSize;
uniform bool boyance;
uniform vec2 wind;
uniform float dt;
uniform bool clear;
uniform vec2 gen;
uniform vec2 genVel;


void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;
    
    gl_FragColor = texture2D(previous, relCord);
    gl_FragColor.g += wind.x * dt * gl_FragColor.r;
    gl_FragColor.b += wind.y * dt * gl_FragColor.r;
    if (boyance) {
        gl_FragColor.b += 10.0 * gl_FragColor.r * dt;
    }

    if (gen.x >= 0.0 && distance(gen.xy, gl_FragCoord.xy) < 10.0) {
        gl_FragColor = vec4(1.0, gl_FragColor.g + genVel.x, genVel.y, 0.0);
    }

    if (clear) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}