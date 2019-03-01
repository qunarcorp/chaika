module.exports = {
  TMP_DIR: './.chaika_cache/chaika',
  DEST_DIR: 'nanachi/source',
  MAIN_PROJECT: 'nnc_home_qunar',
  CACHE_DIR: '.chaika_cache/chaika',
  SOURCE_DIR: 'source',
  PRD_DIR: 'prd',
  LIBS_DIR: 'libs',
  MAIN_MODULE_PREFIX: 'home',
  WATCHEVENTS: ['change', 'unlink'],
  ENV: (() => {
    let env = 'prod',
      argv = process.argv;
    process.argv.forEach((p, index) => {
      if (p === '-e' || p === '--env') {
        let value = argv[index + 1];
        if (value && value[0] !== '-') {
          env = value;
        }
      }
    });
    return {
      app: env.split(',')[0],
      modules: (() => {
        let ret = {},
          list = env.split(',').slice(1);
        list.forEach(str => {
          let kv = str.split(':');
          ret[kv[0]] = kv[1];
        });
        return ret;
      })()
    };
  })()
};
