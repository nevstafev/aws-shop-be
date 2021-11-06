import { HttpService } from '@nestjs/axios';
import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Method } from 'axios';

@Controller()
export class ApiController {
  constructor(private httpService: HttpService) {}
  @All('*')
  async callApi(
    @Req() req: Omit<Request, 'method'> & { method: Method },
    @Res() res: Response,
  ) {
    const recipientParam = req.originalUrl.split('/')[1];
    const recipientUrl = process.env[recipientParam];

    if (recipientUrl) {
      try {
        const url = `${recipientUrl}${req.originalUrl}`;
        console.log(`Calling url ${url}`);

        const apiResponse = await this.httpService
          .request({
            method: req.method,
            url,
            validateStatus: () => true,
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
