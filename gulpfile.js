var gulp =            require('gulp');
var styleguide =      require('sc5-styleguide');
var sass =            require('gulp-sass');
var svgSymbols =      require('gulp-svg-symbols');
var rename =          require('gulp-rename');
var rsp =             require('remove-svg-properties').stream;
var runSequence =     require('run-sequence');
var mainFile =        'sass/main.scss';
var outputPath =      'output';
var iconsPath =       'assets/icons';
var iconsSrc =        iconsPath + '/*.svg';

var renameSymbolPaths = function(path) {
  if (path.extname === '.svg') {
    path.basename = 'icons-map';
    path.dirname = '/assets';
  } else if (path.extname === '.scss') {
    path.basename = '_icons';
    path.dirname = '/sass';
  } else if (path.extname === '.html') {
    path.dirname = outputPath;
  }
};

gulp.task('styleguide:generate', function() {
  return gulp.src('sass/**/*.scss')
    .pipe(styleguide.generate({
        title: 'A demo of svg symbols map with SC5 styleguide',
        server: true,
        rootPath: outputPath,
        overviewPath: 'README.md',
        sideNav: true
      }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src(mainFile)
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});

gulp.task('generate:icons', function(cb) {
  runSequence(
    'prepare:svg',
    'generate:symbols',
    cb);
});

gulp.task('prepare:svg', function() {
  return gulp.src(iconsSrc)
    .pipe(rsp.remove({
      properties: [rsp.PROPS_FILL]
    }))
    .pipe(gulp.dest(iconsPath));
});

gulp.task('generate:symbols', function() {
  return gulp.src(iconsSrc)
    .pipe(svgSymbols({
      title: '%f icon',
      svgClassname: 'ds-icon',
      className: '.ds-icon--%f',
      id: '%f',
      templates: [
        'default-svg',
        './templates/icons.scss',
        './templates/symbols-demo.html'
      ]
    }))
    .pipe(rename(renameSymbolPaths))
    .pipe(gulp.dest('./'));
});

gulp.task('styleguide:assets', function() {
  return gulp.src('assets/**')
    .pipe(gulp.dest(outputPath + '/assets'));
});

gulp.task('watch', ['styleguide'], function() {
  // Start watching changes and update styleguide whenever changes are detected
  // Styleguide automatically detects existing server instance
  // Also Listen to svg folder changes
  gulp.watch(['*.scss', iconsSrc], ['styleguide']);
});

gulp.task('styleguide', function(cb) {
  runSequence(
    'generate:icons',
    [
      'styleguide:generate',
      'styleguide:applystyles',
      'styleguide:assets',
    ],
    cb);
});