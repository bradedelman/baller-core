if [[ $1.ts -nt $1.js ]]; then
    tsc --target es5 --module es2015 --moduleResolution node  --lib dom,es2016,es5 --module amd --out $1.js $1.ts
fi
