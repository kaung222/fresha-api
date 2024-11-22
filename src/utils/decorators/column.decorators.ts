import { ColumnOptions, Column } from 'typeorm';

export function DecimalColumn(
  options: Partial<ColumnOptions> = {},
): PropertyDecorator {
  return Column({
    type: 'decimal',
    precision: 10, // Default precision, can be overridden
    scale: 2, // Default scale, can be overridden
    default: 0, // Default value, can be overridden
    transformer: {
      to(value: number): string {
        return value?.toString();
      },
      from(value: string): number {
        return parseFloat(value);
      },
    },
    ...options, // Allow overriding defaults
  });
}
