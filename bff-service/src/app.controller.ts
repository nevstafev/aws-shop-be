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
    const recipientParam = req.params[0].split('/')[0];
    const recipientUrl = process.env[recipientParam];

    if (recipientUrl) {
      try {
        const apiResponse = await this.httpService
          .request({
            method: req.method,
            url: `${recipientUrl}${req.originalUrl}`,
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
