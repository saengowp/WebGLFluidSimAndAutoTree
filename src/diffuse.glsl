uniform sampler2D previous;
uniform vec2 screenSize;
uniform vec2 gen;
uniform float dt;

void main() {
    vec2 relCord = gl_FragCoord.xy / screenSize.xy;
    vec2 unitDist = vec2(1.0, 1.0)/screenSize.xy;

    vec4 left = texture2D(previous, vec2(relCord.x - unitDist.x, relCord.y)),
        right = texture2D(previous, vec2(relCord.x + unitDist.x, relCord.y)),
        up = texture2D(previous, vec2(relCord.x , relCord.y + unitDist.y)),
        down = texture2D(previous, vec2(relCord.x , relCord.y - unitDist.y)),
        cen = texture2D(previous, relCord);
    
    gl_FragColor = cen;
    float diff = 0.01;
    float a = dt * diff * screenSize.x * screenSize.y;
    gl_FragColor[0] = (cen[0] + a*(left[0] + right[0] + up[0] + down[0]))/(1.0 + 4.0*a);
    gl_FragColor[1] = (cen[1] + a*(left[1] + right[1] + up[1] + down[1]))/(1.0 + 4.0*a);
    gl_FragColor[2] = (cen[2] + a*(left[2] + right[2] + up[2] + down[2]))/(1.0 + 4.0*a);

    if (gen.x >= 0.0 && distance(gen.xy, gl_FragCoord.xy) < 15.0) {
        gl_FragColor = vec4(1.0, 100.0, 0.0, 1.0);
    }
}