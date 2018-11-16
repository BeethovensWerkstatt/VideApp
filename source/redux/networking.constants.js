/**
 * Connection Status constants
 * @namespace
 */
const StatusCodes = {
    /** no request has been made */
    NO_CONNECTION: 'NO_CONNECTION',
    /** request underway / isFetching data */
    CODE_100: '100',
    /** request successfull */
    CODE_200: '200',
    /** request successfull, no content available */
    CODE_204: '204',
    /** missing authorization */
    CODE_401: '401',
    /** not found / error */
    CODE_404: '404'
};
export { StatusCodes };
