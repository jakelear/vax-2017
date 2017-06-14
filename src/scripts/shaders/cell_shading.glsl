// https://www.shadertoy.com/view/Msl3zB
uniform float iGlobalTime;
uniform float amplitude;
uniform sampler2D video;
uniform sampler2D underlay;

varying vec2 vUv;

void main(void)
{
  #define EPS 2.e-3
  vec2 uv = vUv;
  vec2 uvx = uv+vec2(EPS,0.);
  vec2 uvy = uv+vec2(0.,EPS);
  vec3 tex,texx,texy;
  vec2 grad; float g=1.;

  for (int i=0; i<30; i++)
  {
    tex = texture2D(video, uv).xyz;
    texx = texture2D(video, uvx).xyz;
    texy = texture2D(video, uvy).xyz;
    grad  = vec2(texx.x-tex.x,texy.x-tex.x);

    uv    += EPS*grad;
    uvx.x += EPS*grad.x;
    uvy.y += EPS*grad.y;
  }

  vec3 col = texture2D(video, uv).xyz;
  vec3 m = vec3(.2,.1,.1);
  float lum = clamp(0.5 - amplitude, 0.06, 0.5);
  #if 1
    g = 4.*dot(grad,grad);
    g = pow(max(0.,1.-g),30.);
    g = clamp(g,0.,1.);
  #endif
  col = g * col / pow(lum,.55);

  gl_FragColor = vec4(col, 1.0);
}
