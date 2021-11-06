import { HttpService } from '@nestjs/axios';
import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Method } from 'axios';
import { ParamsDictionary } from 'express-serve-static-core';

const getUrlWithoutPrefix = (url: string, urlPrefix: string | null): string => {
  if (!urlPrefix || urlPrefix.length === 0) {
    return url;
  }
  return url.split(`${urlPrefix}/`)[1];
};

const getRecipientFromParams = (params: ParamsDictionary): string | null => {
  const paramsString = params[0];
  if (!paramsString || paramsString.length === 0) {
    return null;
  }
  return getUrlWithoutPrefix(paramsString, process.env.URL_PREFIX).split(
    '/',
  )[0];
};

@Controller()
export class ApiController {
  constructor(private httpService: HttpService) {}
  @All('*')
  async callApi(
    @Req() req: Omit<Request, 'method'> & { method: Method },
    @Res() res: Response,
  ) {
    const recipientParam = getRecipientFromParams(req.params);

    const recipientUrl = process.env[recipientParam];

    if (recipientUrl) {
      try {
        const apiResponse = await this.httpService
          .request({
            method: req.method,
            url: `${recipientUrl}${req.originalUrl}`,
            ...(Object.keys(req.body).length > 0 ? { data: req.body } : {}),
          })
          .toPromise();

        res.json(apiResponse.data);
      } catch (e) {
        res.status(502).end('Cannot process request');
      }
    } else {
      res.status(502).end('Cannot process request');
    }
  }
}
