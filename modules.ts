const modules: any = [
  {
    name: 'module 1',
    description: 'This is module 1',
    id: 'module1',
    submodules: [],
  },
  {
    name: 'module 2',
    description: 'This is module 1',
    id: 'module1',
    submodules: [
      {
        name: 'module 2.2',
        description: 'This is module 1',
        id: 'module1',
        submodules: [
          {
            name: 'module 2.2.1',
            description: 'This is module 1',
            id: 'module1',
            submodules: [],
          },
          {
            name: 'module 2.2.2',
            description: 'This is module 1',
            id: 'module1',
            submodules: [],
          },
        ],
      },
      {
        name: 'module 2.2',
        description: 'This is module 1',
        id: 'module1',
        submodules: [],
      },
    ],
  },
  {
    name: 'module 3',
    description: 'This is module 1',
    id: 'module1',
    submodules: [
      {
        name: 'module 3.1',
        description: 'This is module 1',
        id: 'module1',
        submodules: [],
      },
    ],
  },
];

const exampleModule = [
  {
    name: '1. module 1',
    description: 'This is module 1',
    id: 'module1',
  },
  {
    name: '2. module 2',
    description: 'This is module 2',
    id: 'module2',
  },
  {
    name: '2.1 module 2.1',
    description: 'This is module 2.1',
    id: 'module2.1',
  },
  {
    name: '2.2 module 2.2',
    description: 'This is module 2.2',
    id: 'module2.2',
  },
  {
    name: '2.2.1 module 2.2',
    description: 'This is module 2.2',
    id: 'module2.2.1',
  },
  {
    name: '2.2.2 module 2.2',
    description: 'This is module 2.2',
    id: 'module2.2.2',
  },
  {
    name: 'module 3',
    description: 'This is module 3',
    id: 'module3',
  },
];

function flattenModules(modules, prefix = '') {
  let result = [];
  modules.forEach((module, idx) => {
    const numbering = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
    // Exclude submodules using destructuring
    const { submodules, ...rest } = module;
    result.push({
      ...rest,
      name: `${numbering} ${module.name}`,
    });
    if (submodules && submodules.length) {
      result = result.concat(flattenModules(submodules, numbering));
    }
  });
  return result;
}

// Usage:
const flatModules = flattenModules(modules);
console.log(flatModules);
