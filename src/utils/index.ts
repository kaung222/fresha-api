export * from './base.entity';

export function generateOpt() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
