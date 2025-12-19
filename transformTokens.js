import StyleDictionary from 'style-dictionary';

// 1. Create the Style Dictionary instance
const sd = new StyleDictionary({
  source: ["tokens/*.json"],
  platforms: {
    // scss: {
    //   transformGroup: "custom/css",
    //   buildPath: "build/scss/",
    //   files: [
    //     {
    //       destination: "_variables.scss",
    //       // Using our new custom format for SCSS as well
    //       format: "scss/variables-flattened",
    //       filter: "validToken",
    //     },
    //   ],
    // },
    css: {
      transformGroup: "custom/css",
      buildPath: "src/lib/styles/",
      files: [
        {
          destination: "_variables.css",
          // Using our new custom format here
          format: "css/variables-flattened",
          filter: "validToken",
          options: {
            showFileHeader: false,
          },
        },
      ],
    },
  },
});

/**
 * 2. Register Custom Formats (Flattening Logic)
 */

// Custom CSS Format
sd.registerFormat({
  name: 'css/variables-flattened',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.map(token => {
      // If it's a typography token, expand it into multiple variables
      if (token.type === 'custom-fontStyle' || token.type === 'typography') {
        const { fontWeight, fontSize, lineHeight, fontFamily, letterSpacing } = token.value;
        return `  --${token.name}-font-weight: ${fontWeight};
  --${token.name}-font-size: ${fontSize}px;
  --${token.name}-line-height: ${lineHeight}px;
  --${token.name}-font-family: "${fontFamily}";
  --${token.name}-letter-spacing: ${letterSpacing}px;`;
      }
      // Standard output for all other tokens
      return `  --${token.name}: ${token.value};`;
    }).join('\n');

    return `:root {\n${tokens}\n}`;
  }
});

// Custom SCSS Format (Same logic, but with $ syntax)
// sd.registerFormat({
//   name: 'scss/variables-flattened',
//   format: ({ dictionary }) => {
//     return dictionary.allTokens.map(token => {
//       if (token.type === 'custom-fontStyle' || token.type === 'typography') {
//         const { fontWeight, fontSize, lineHeight, fontFamily, letterSpacing } = token.value;
//         return `$${token.name}-font-weight: ${fontWeight};
// $${token.name}-font-size: ${fontSize}px;
// $${token.name}-line-height: ${lineHeight}px;
// $${token.name}-font-family: "${fontFamily}";
// $${token.name}-letter-spacing: ${letterSpacing}px;`;
//       }
//       return `$${token.name}: ${token.value};`;
//     }).join('\n');
//   }
// });

/**
 * 3. Register Custom Transforms
 */

// Shadow Transform (Keeps shorthand for shadows as it's cleaner in CSS)
sd.registerTransform({
  name: 'value/shadow',
  type: 'value',
  filter: token => token.type === 'custom-shadow',
  transform: token => {
    const { offsetX, offsetY, radius, spread, color } = token.value;
    return `${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color}`;
  }
});

sd.registerTransform({
  name: 'size/px',
  type: 'value',
  filter: token => (token.unit === 'pixel' || token.type === 'dimension') && token.value !== 0,
  transform: token => `${token.value}px`
});

sd.registerTransform({
  name: 'size/percent',
  type: 'value',
  filter: token => token.unit === 'percent' && token.value !== 0,
  transform: token => `${token.value}%`
});

// 4. Register Filter
sd.registerFilter({
  name: 'validToken',
  filter: (token) => [
    "dimension", "string", "number", "color", "custom-spacing",
    "custom-gradient", "custom-fontStyle", "custom-radius", "custom-shadow"
  ].includes(token.type)
});

// 5. Register Transform Group
sd.registerTransformGroup({
  name: 'custom/css',
  transforms: ['name/kebab', 'size/px', 'size/percent', 'color/css', 'value/shadow']
});

// 6. Build
async function run() {
  try {
    await sd.buildAllPlatforms();
    console.log('\n🚀 Build completed! Typography is now flattened.');
  } catch (err) {
    console.error('\n❌ Build failed:', err);
    process.exit(1);
  }
}

run();
