export * from './base.entity';

export function generateOpt() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export enum ParamType {
  array = 'array',
  string = 'string',
  object = 'object',
  unknown = 'unknown',
}
export function checkType(param: any): ParamType {
  if (Array.isArray(param)) {
    return ParamType.array;
  } else if (typeof param === 'string') {
    return ParamType.string;
  } else if (
    typeof param === 'object' &&
    param !== null &&
    !Array.isArray(param)
  ) {
    return ParamType.object;
  } else {
    return ParamType.unknown;
  }
}
