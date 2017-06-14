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

  vec2 ref = vec2(.5,.5);
  vec3 col0 = texture2D(video, ref).xyz;
  float lum0 = (col0.x+col0.y+col0.z)/3.;

  bool isin = (uv.x > .5+.5*sin(iGlobalTime));

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
  float lum = (col.x+col.y+col.z)/3.;
  #if 1
    g = 4.*dot(grad,grad);
    g = pow(max(0.,1.-g),30.);
    g = clamp(g,0.,1.);
  #endif
  col = g * col / pow(lum,.55);

  gl_FragColor = vec4(col, 1.0);
}


// varying vec2 vUv;

// #define SPEED 0.05

// vec4 rgbShift( in vec2 p , in vec4 shift) {
//     shift *= 2.0*shift.w - 1.0;
//     vec2 rs = vec2(shift.x,-shift.y);
//     vec2 gs = vec2(shift.y,-shift.z);
//     vec2 bs = vec2(shift.z,-shift.x);

//     float r = texture2D(video, p+rs, 0.0).x;
//     float g = texture2D(video, p+gs, 0.0).y;
//     float b = texture2D(video, p+bs, 0.0).z;

//     return vec4(r,g,b,1.0);
// }

// vec4 noise( in vec2 p ) {
//     return texture2D(underlay, p, 0.0);
// }

// vec4 vec4pow( in vec4 v, in float p ) {
//     // Don't touch alpha (w), we use it to choose the direction of the shift
//     // and we don't want it to go in one direction more often than the other
//     return vec4(pow(v.x,p),pow(v.y,p),pow(v.z,p),v.w);
// }

// void main(void)
// {
//   vec2 p = vUv;
//   vec4 c = vec4(0.0,0.0,0.0,1.0);

//   // Elevating shift values to some high power (between 8 and 16 looks good)
//   // helps make the stuttering look more sudden
//   vec4 shift = vec4pow(noise(vec2(SPEED*iGlobalTime,2.0*SPEED*iGlobalTime/25.0 )),8.0)
//           *vec4(amplitude,amplitude,amplitude,1.0);;

//   c += rgbShift(p, shift);

//   gl_FragColor = c;
// }
