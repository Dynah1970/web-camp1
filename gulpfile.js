const { src, dest, watch, parallel } = require('gulp');

// CSS
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');

// Imagenes
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const avif = require('gulp-avif');

// Javascript
const terser = require('gulp-terser-js');
const concat = require('gulp-concat');
const rename = require('gulp-rename');

// Webpack
const webpack = require('webpack-stream');

const paths = {
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js',
    imagenes: 'src/img/**/*'
};

// CSS Task
function css() {
    return src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))  // Agregado manejo de errores para SASS
        .pipe(postcss([autoprefixer()]))  // Añadido autoprefixer
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/build/css'));
}

// Javascript Task
function javascript() {
    return src(paths.js)
        .pipe(webpack({
            mode: 'production',
            entry: './src/js/app.js',  // Asegúrate que la ruta sea correcta
            output: {
                filename: 'app.min.js'  // Nombre del archivo minificado
            },
            module: {
                rules: [
                    {
                        test: /\.js$/i,  // Regla para archivos JS
                        use: 'babel-loader',  // Usar Babel para transpilar JS
                    }
                ]
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(terser())  // Minimiza el JS
        .pipe(sourcemaps.write('.'))
        .pipe(rename({ suffix: '.min' }))  // Nombre final del archivo
        .pipe(dest('./public/build/js'));  // Salida en 'public/build/js'
}

// Imágenes Task
function imagenes() {
    return src(paths.imagenes)
        .pipe(cache(imagemin({ optimizationLevel: 3 })))  // Optimización de imágenes
        .pipe(dest('public/build/img'));  // Salida de imágenes optimizadas
}

// WebP Version Task
function versionWebp(done) {
    const opciones = {
        quality: 50  // Ajuste de calidad para WebP
    };
    src('src/img/**/*.{png,jpg}')
        .pipe(webp(opciones))
        .pipe(dest('public/build/img'));  // Salida de imágenes WebP
    done();
}

// AVIF Version Task
function versionAvif(done) {
    const opciones = {
        quality: 50  // Ajuste de calidad para AVIF
    };
    src('src/img/**/*.{png,jpg}')
        .pipe(avif(opciones))
        .pipe(dest('public/build/img'));  // Salida de imágenes AVIF
    done();
}

// Development Task (watch files)
function dev(done) {
    watch(paths.scss, css);  // Observa archivos SCSS
    watch(paths.js, javascript);  // Observa archivos JS
    watch(paths.imagenes, imagenes);  // Observa imágenes
    watch(paths.imagenes, versionWebp);  // Observa y genera imágenes WebP
    watch(paths.imagenes, versionAvif);  // Observa y genera imágenes AVIF
    done();
}

// Exports
exports.css = css;
exports.js = javascript;
exports.imagenes = imagenes;
exports.versionWebp = versionWebp;
exports.versionAvif = versionAvif;
exports.dev = parallel(css, imagenes, versionWebp, versionAvif, javascript, dev);  // Tareas para desarrollo
