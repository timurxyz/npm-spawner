This simple TS/JS code is to programmatically run npm/yarn/pnpm commands/scripts. The general case is when your Node app/script launches a script from ``package.json`` like ``yarn deploy``. The code wraps ``spawn`` of the Node's 'child_process' module and adds the natural accompanying stuff: streams config and catching errors. (``spawn`` is the variant of ``exec`` that one would use for processes emitting stuff to stdio.)

The reason is to circumvent "The programmatic API was removed in npm v8.0.0" problem.

Usage:
```typescript
npmSpawner( "run deploy:local", { npm: "yarn"});
```

You also get a more general "spawner" for launching any system command:
```typescript
spawnNodeChild( 'find', '.', { 
  cwd: '~/',
  nodeSpawnOptions: {
    shell: '/bin/bash --restricted'
  }
});
```

* Unlike with pure ``spawn`` you can provide args as a space-separated single string.
* Both versions return: ``<ChildProcess>``.
* Note: this package delivers a pure ESM module.