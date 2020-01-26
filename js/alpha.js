const alphaVertex = `
    varying vec2 vUv;

    void main() {

        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
`,
alphaFragment = `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;

    varying vec2 vUv;

    vec4 getTexture( sampler2D texelToLinearTexture ) {

        return mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );

    }

    void main() {
        vec4 baseColor = getTexture( baseTexture );
        vec3 bloom = getTexture( bloomTexture ).rgb;
        float bloomAlpha = sqrt((bloom.r + bloom.g + bloom.b) / 3.0);
        float alpha = mix(bloomAlpha, baseColor.a, sign(baseColor.a));
        gl_FragColor = vec4(baseColor.rgb + bloom, alpha);

    }
`

export {alphaFragment, alphaVertex}

