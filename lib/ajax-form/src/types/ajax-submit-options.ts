import {AjaxFormResult} from './ajax-form-result';

export type AjaxSubmitOptions = {
    url: string;
    data?: Record<string, unknown> | FormData;
    element?: HTMLElement;
    loadingClass?: string;
    method?: string;
    headers?: HeadersInit;
    beforeSubmit?: (options: AjaxSubmitOptions) => false | void;
    beforeSend?: (formData?: FormData) => void | FormData;
    contentType?: 'multipart/form-data',
    onSuccess?: (result: AjaxFormResult) => void | false;
    onFail?: (result: AjaxFormResult) => void | false;
    onError?: (error: Error, responseText?: string) => void;
    onComplete?: (result?: AjaxFormResult, error?: Error) => void;
    onMessage?: (message: string | Record<string, string | string[]>, result: AjaxFormResult) => void;
} & Pick<AjaxFormResult, 'callback' | 'closeModal' | 'load'>;