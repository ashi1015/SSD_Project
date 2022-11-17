import { File, FileSchema } from './models/file.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Message, MessageSchema } from './models/message.schema';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { User, UserSchema } from './models/user.schema';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';
import { GridFsMulterConfigService } from './services/gridFsMulter.service';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { isAuthenticated } from './middleware/app.middleware';
import { join } from 'path/posix';
import { secret } from './utils/constants';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://root:root@ssd.cuimwpr.mongodb.net/?retryWrites=true&w=majority'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    JwtModule.register({
      secret,
      signOptions : { expiresIn: '1h'},
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    // MulterModule.register({
    //   storage: diskStorage({
    //     destination: './uploads',
    //     filename: (req, file, cb) => {
    //       const ext = extname(file.originalname);
    //       const fileName = `${file.originalname}-${Date.now() + '-' + Math.round(Math.random() * 1e9)}${ext}`;
    //       cb(null, fileName);
    //     },
    //   })
    // }),
    MulterModule.registerAsync({
      useClass: GridFsMulterConfigService,
  }),
  ],
  controllers: [AppController, UserController, MessageController, FileController],
  providers: [AppService, UserService, MessageService, FileService, GridFsMulterConfigService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      // .exclude(
      //   { path: '/api/v1/message', method: RequestMethod.GET }
      // )
      .forRoutes(MessageController, FileController);
  }
}
