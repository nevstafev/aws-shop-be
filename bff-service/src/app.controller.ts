import { HttpService } from '@nestjs/axios';
import {
  All,
  CACHE_MANAGER,
  Controller,
  Inject,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Method } from 'axios';
import { Cache } from 'cache-manager';

const isCacheable = (req: Request): boolean => {
  const urlPats = req.originalUrl.split('/');
  if (urlPats.length !== 2 && req.method === 'GET') {
    return false;
  }
  const recipient = urlPats[1];
  return Boolean(process.env[`${recipient}_cache`]);
};

@Controller()
export class ApiController {
  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  @All('*')
  async callApi(
    @Req() req: Omit<Request, 'method'> & { method: Method },
    @Res() res: Response,
  ) {
    const recipient = req.originalUrl.split('/')[1];
    const recipientUrl = process.env[recipient];

    if (recipientUrl) {
      try {
        const cacheable = isCacheable(req);
        if (cacheable) {
          const value = await this.cacheManager.get(recipient);

          if (value) {
            return res.json(value);
          }
        }
        const url = `${recipientUrl}${req.originalUrl}`;

        const apiResponse = await this.httpService
          .request({
            method: req.method,
            url,
            validateStatus: () => true,
            ...(Object.keys(req.body).length > 0 ? { data: req.body } : {}),
          })
          .toPromise();
        if (cacheable) {
          this.cacheManager.set(recipient, apiResponse.data, { ttl: 120 });
        }
        res.json(apiResponse.data);
      } catch (e) {
        res.status(502).end('Cannot process request');
      }
    } else {
      res.status(502).end('Cannot process request');
    }
  }
}
