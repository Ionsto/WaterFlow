precision mediump float;
varying vec4 vColour;
float round(float x)
{
	return floor(x+0.5);
}
void main(void) {
	if(floor(vColour.w) == 1.0)
	{
		gl_FragColor = vec4(0,1,0, 1.0);
	}
	else{
		float Colourprecision = 10.0;
		gl_FragColor = vec4(round(vColour.x*Colourprecision)/Colourprecision,round(vColour.y*Colourprecision)/Colourprecision,round(vColour.z*Colourprecision)/Colourprecision, 1.0);
	}
}
