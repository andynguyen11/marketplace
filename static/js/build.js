/**
 * Build profile for django-require.
 *
 * This supports all the normal configuration available to a r.js build profile. The only gotchas are:
 *
 *   - 'baseUrl' will be overidden by django-require during the build process.
 *   - 'appDir' will be overidden by django-require during the build process.
 *   - 'dir' will be overidden by django-require during the build process.
 */
({

    /*
     * List the modules that will be optimized. All their immediate and deep
     * dependencies will be included in the module's file when the build is
     * done. A minimum module entry is {name: "module_name"}.
     */
    modules: [
      {
        name: 'app/customer'
      },
      {
        name: 'app/landing-page'
      },
      {
        name: 'app/signup'
      }
    ],

    stubModules: ['jsx', 'text', 'JSXTransformer'],

    paths: {
      jquery: '../bower_components/jquery/dist/jquery',
      jsx: 'library/jsx',
      JSXTransformer: 'library/JSXTransformer',
      react: '../bower_components/react/react-with-addons',
      stripe: 'https://js.stripe.com/v2/?sensor=false',
      text: 'library/text',
      formValidation: 'library/formValidation.popular.min',
      bootstrapValidationExt: 'library/validation.bootstrap.min',
      mapbox: 'https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.js?sensor=false',
      rating: 'library/star-rating.min',
      bootstrap: 'library/bootstrap',
      ga: '//www.google-analytics.com/analytics',
      gmaps: '//maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places'
    },
    shim: {
      formValidation:  ['jquery', 'bootstrap'],
      rating: ['jquery'],
      bootstrap: ['jquery'],
      bootstrapValidationExt: ['formValidation'],
      csrf: ['jquery'],
      gmaps: { exports: 'google' },
      mapbox: { exports: 'L' }
    },
    jsx: {
      fileExtension: '.jsx'
    },
    deps: ['jquery', 'csrf', 'api', 'library/tawk'],

    /*
     * Allow CSS optimizations. Allowed values:
     * - "standard": @import inlining, comment removal and line returns.
     * Removing line returns may have problems in IE, depending on the type
     * of CSS.
     * - "standard.keepLines": Like "standard" but keeps line returns.
     * - "none": Skip CSS optimizations.
     * - "standard.keepComments": Keeps the file comments, but removes line returns.
     * - "standard.keepComments.keepLines": Keeps the file comments and line returns.
     */
    optimizeCss: "none",

    /*
     * How to optimize all the JS files in the build output directory.
     * Right now only the following values are supported:
     * - "uglify": Uses UglifyJS to minify the code.
     * - "uglify2": Uses UglifyJS2.
     * - "closure": Uses Google's Closure Compiler in simple optimization
     * mode to minify the code. Only available if REQUIRE_ENVIRONMENT is "rhino" (the default).
     * - "none": No minification will be done.
     */
    optimize: "none",

    /*
     * By default, comments that have a license in them are preserved in the
     * output. However, for a larger built files there could be a lot of
     * comment files that may be better served by having a smaller comment
     * at the top of the file that points to the list of all the licenses.
     * This option will turn off the auto-preservation, but you will need
     * work out how best to surface the license information.
     */
    preserveLicenseComments: true,

    /*
     * The default behaviour is to optimize the build layers (the "modules"
     * section of the config) and any other JS file in the directory. However, if
     * the non-build layer JS files will not be loaded after a build, you can
     * skip the optimization of those files, to speed up builds. Set this value
     * to true if you want to skip optimizing those other non-build layer JS
     * files.
     */
    skipDirOptimize: false

})