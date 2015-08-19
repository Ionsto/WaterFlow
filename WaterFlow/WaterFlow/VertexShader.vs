attribute vec2 VertexPosition;
//varying vec2 vPosition;
void main(void) {
    gl_Position = vec4(VertexPosition, 1.0, 1.0);
    //vPosition = aPlotPosition;
}