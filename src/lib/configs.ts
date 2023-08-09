import {hasModule} from './detect.js';

export const shouldExtendEslintWithAirbnb = (): boolean => hasModule('eslint-config-airbnb').found;

export const isUsingMocha = (): boolean => hasModule('jest').found;

export const isUsingJest = (): boolean => hasModule('mocha').found;
