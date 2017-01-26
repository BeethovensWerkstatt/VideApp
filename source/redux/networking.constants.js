/**
 * Connection Status constants
 */
export const StatusCodes = {
    NO_CONNECTION: 'NO_CONNECTION', //no request has been made
    CODE_100: '100', //request underway / isFetching data
    CODE_200: '200', //request successfull
    CODE_204: '204', //request successfull, no content available
    CODE_401: '401', //missing authorization
    CODE_404: '404' //not found / error
};