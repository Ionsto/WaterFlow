attribute vec2 VertexPosition;
attribute vec4 VertexColour;//R,G,B, Type
varying vec4 vColour;
void main(void) {
    gl_Position = vec4(VertexPosition, 0.0, 1.0);
    vColour = VertexColour;
}
