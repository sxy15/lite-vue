import { withInstall } from '../utils/with-install';
import _Button from './Button';

export const Button = withInstall(_Button);
export default Button;

export { buttonProps } from './Button';
export type { ButtonProps } from './Button';
export type { ButtonType, ButtonSize } from './types';

declare module 'vue' {
  export interface GlobalComponents {
    SxButton: typeof Button;
  }
}
