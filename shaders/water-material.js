/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

AFRAME.registerShader['water'] = {

  uniforms: THREE.UniformsUtils.merge( [
    THREE.UniformsLib[ "fog" ], { 
      "normalSampler":    { type: "t", value: null },
      "mirrorSampler":    { type: "t", value: null },
      "alpha":            { type: "f", value: 1.0 },
      "time":             { type: "f", value: 0.0 },
      "distortionScale":  { type: "f", value: 20.0 },
      "noiseScale":       { type: "f", value: 1.0 },
      "textureMatrix" :   { type: "m4", value: new THREE.Matrix4() },
      "sunColor":         { type: "c", value: new THREE.Color(0x7F7F7F) },
      "sunDirection":     { type: "v3", value: new THREE.Vector3(0.70707, 0.70707, 0) },
      "eye":              { type: "v3", value: new THREE.Vector3(0, 0, 0) },
      "waterColor":       { type: "c", value: new THREE.Color(0x555555) }
    }
  ] ),

  vertexShader: [
    'uniform mat4 textureMatrix;',
    'uniform float time;',

    'varying vec4 mirrorCoord;',
    'varying vec3 worldPosition;',
    'varying vec3 modelPosition;',
    'varying vec3 surfaceX;',
    'varying vec3 surfaceY;',
    'varying vec3 surfaceZ;',
    
    'void main()',
    '{',
    '  mirrorCoord = modelMatrix * vec4(position, 1.0);',
    '  worldPosition = mirrorCoord.xyz;',
    '  modelPosition = position;',
    '  surfaceX = vec3( modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2]);',
    '  surfaceY = vec3( modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2]);',
    '  surfaceZ = vec3( modelMatrix[2][0], modelMatrix[2][1], modelMatrix[2][2]);',
    
    '  mirrorCoord = textureMatrix * mirrorCoord;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n'),

  fragmentShader: [    
    'uniform sampler2D mirrorSampler;',
    'uniform float alpha;',
    'uniform float time;',
    'uniform float distortionScale;',
    'uniform float noiseScale;',
    'uniform sampler2D normalSampler;',
    'uniform vec3 sunColor;',
    'uniform vec3 sunDirection;',
    'uniform vec3 eye;',
    'uniform vec3 waterColor;',

    'varying vec4 mirrorCoord;',
    'varying vec3 worldPosition;',
    'varying vec3 modelPosition;',
    'varying vec3 surfaceX;',
    'varying vec3 surfaceY;',
    'varying vec3 surfaceZ;',
    
    'void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, in float shiny, in float spec, in float diffuse, inout vec3 diffuseColor, inout vec3 specularColor)',
    '{',
    '  vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));',
    '  float direction = max(0.0, dot(eyeDirection, reflection));',
    '  specularColor += pow(direction, shiny) * sunColor * spec;',
    '  diffuseColor += max(dot(sunDirection, surfaceNormal), 0.0) * sunColor * diffuse;',
    '}',
    
    'vec3 getNoise(in vec2 uv)',
    '{',
    '  vec2 uv0 = uv / (103.0 * noiseScale) + vec2(time / 17.0, time / 29.0);',
    '  vec2 uv1 = uv / (107.0 * noiseScale) - vec2(time / -19.0, time / 31.0);',
    '  vec2 uv2 = uv / (vec2(8907.0, 9803.0) * noiseScale) + vec2(time / 101.0, time /   97.0);',
    '  vec2 uv3 = uv / (vec2(1091.0, 1027.0) * noiseScale) - vec2(time / 109.0, time / -113.0);',
    '  vec4 noise = texture2D(normalSampler, uv0) +',
    '    texture2D(normalSampler, uv1) +',
    '    texture2D(normalSampler, uv2) +',
    '    texture2D(normalSampler, uv3);',
    '  return noise.xyz * 0.5 - 1.0;',
    '}',
    
    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
    
    'void main()',
    '{',
    '  vec3 worldToEye = eye - worldPosition;',
    '  vec3 eyeDirection = normalize(worldToEye);',
    
    // Get noise based on the 3d position
    '  vec3 noise = getNoise(modelPosition.xy * 1.0);',
    '  vec3 distordCoord = noise.x * surfaceX + noise.y * surfaceY;',
    '  vec3 distordNormal = distordCoord + surfaceZ;',
    
    // Revert normal if the eye is bellow the mesh
    '  if(dot(eyeDirection, surfaceZ) < 0.0)',
    '    distordNormal = distordNormal * -1.0;',

    // Compute diffuse and specular light (use normal and eye direction)
    '  vec3 diffuseLight = vec3(0.0);',
    '  vec3 specularLight = vec3(0.0);',
    '  sunLight(distordNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight);',
    
    // Compute final 3d distortion, and project it to get the mirror sampling
    '  float distance = length(worldToEye);',
    '  vec2 distortion = distordCoord.xy * distortionScale * sqrt(distance) * 0.07;',
    ' vec3 mirrorDistord = mirrorCoord.xyz + vec3(distortion.x, distortion.y, 1.0);',
    ' vec3 reflectionSample = texture2DProj(mirrorSampler, mirrorDistord).xyz;',

    // Compute other parameters as the reflectance and the water appareance
    '  float theta = max(dot(eyeDirection, distordNormal), 0.0);',
    '  float reflectance = 0.3 + (1.0 - 0.3) * pow((1.0 - theta), 3.0);',
    '  vec3 scatter = max(0.0, dot(distordNormal, eyeDirection)) * waterColor;',
    
    // Compute final pixel color
    '  vec3 albedo = mix(sunColor * diffuseLight * 0.3 + scatter, (vec3(0.1) + reflectionSample * 0.9 + reflectionSample * specularLight), reflectance);',
    
    ' vec3 outgoingLight = albedo;', 
    THREE.ShaderChunk[ "fog_fragment" ],
    
    ' gl_FragColor = vec4( outgoingLight, alpha );',
    '}'
  ].join('\n')

};