// Re-export Firebase types from @firebase packages so TypeScript can resolve
// firebase/app and firebase/firestore sub-path imports under moduleResolution "bundler".
declare module 'firebase/app' {
  export * from '@firebase/app';
}

declare module 'firebase/firestore' {
  export * from '@firebase/firestore';
}

declare module 'firebase/analytics' {
  export * from '@firebase/analytics';
}

declare module 'firebase/storage' {
  export * from '@firebase/storage';
}
