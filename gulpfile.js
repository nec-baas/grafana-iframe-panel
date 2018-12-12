'use strict';

const gulp = require('gulp');
const typescript  = require('gulp-typescript');
const mocha = require('gulp-mocha');
const clean = require('gulp-clean');
const watch = require('gulp-watch');

const tsProject = typescript.createProject("tsconfig.json");

gulp.task('copy_html',() => {
    return gulp.src('src/partials/*.html').pipe(gulp.dest('./dist/partials/'));
});

gulp.task('copy_css', () => {
    return gulp.src('src/css/*.css').pipe(gulp.dest('./dist/css/'));
});
gulp.task('copy_img', () => {
    return gulp.src('src/img/*').pipe(gulp.dest('./dist/img/'));
});

gulp.task('copy_static', () => {
    return gulp.src(['src/plugin.json', 'LICENSE', 'README.md']).pipe(gulp.dest('./dist/'));
});

gulp.task('copy', ['copy_html', 'copy_css', 'copy_img', 'copy_static']);

gulp.task('ts', () => {
    return gulp.src('src/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('./dist'));
});

gulp.task('test-ts', () => {
    const p = typescript.createProject("tsconfig.test.json");
    return gulp.src('src/**/*.ts')
        .pipe(p())
        .js.pipe(gulp.dest('./dist-spec'));
});

gulp.task('test', ['test-ts'], () => {
    return gulp.src(['dist-spec/spec/*.js'], {read: false})
        .pipe(mocha());
});

gulp.task('clean', () => {
    return gulp.src(['dist', 'dist-spec']).pipe(clean());
});

gulp.task('watch', () => {
    gulp.watch('src/*.ts', ['ts', 'test-ts']);
    gulp.watch('src/spec/*.ts', ['test-ts']);
    gulp.watch(['src/**/*.html', 'src/**/*.css', 'src/img/*', 'src/plugin.json', 'README.md', 'LICENSE'], ['copy']);
});

gulp.task('default', ['copy', 'ts', 'test-ts']);
