/**
 * Writen with the help of this article:
 * 
 * @link https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html
 * @link https://github.com/sensedeep/dynamodb-onetable/blob/main/package.json
 */


export const hasModule = (name: string): boolean => { return true }


export const shouldExtendAirbnb = (): boolean => hasModule('')

export const isUsingMocha = (): boolean => hasModule('')

export const isUsingJest = (): boolean => hasModule('')