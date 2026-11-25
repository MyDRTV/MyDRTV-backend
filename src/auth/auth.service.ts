import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { PasswordService } from '../common/password/password.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly passwordService: PasswordService,

    private readonly jwtService: JwtService,
  ) {}

  //------------------ Sign up user ------------------//
  async signup(signUpDto: SignUpDto) {
    // Kontrollér om email allerede eksisterer
    const existingEmail = await this.userRepository.findOne({
      where: {
        user_email: signUpDto.email,
      },
    });

    if (existingEmail) {
      throw new ConflictException('Email er allerede i brug');
    }

    // Kontrollér om brugernavn allerede eksisterer
    const existingUsername = await this.userRepository.findOne({
      where: {
        user_name: signUpDto.username,
      },
    });

    if (existingUsername) {
      throw new ConflictException('Brugernavn er allerede i brug');
    }

    // Hash og salt password
    const hashedPassword = await this.passwordService.hashPassword(
      signUpDto.password,
    );

    const user = this.userRepository.create({
      user_pk: crypto.randomUUID().replace(/-/g, ''),
      user_name: signUpDto.username,
      user_email: signUpDto.email,
      user_role: 'user',
      user_password: hashedPassword,
      user_created_at: Date.now(),
    });

    await this.userRepository.save(user);

    return {
      message: 'Bruger oprettet',
    };
  }

  //------------------ Login user ------------------//
  async login(logInDto: LogInDto) {
    // Find bruger og hent password-hash eksplicit
    const user = await this.userRepository
      // createQueryBuilder() bruges til at oprette en forespørgsel, der kan tilpasses
      .createQueryBuilder('user')

      // addSelect() bruges til at inkludere user_password i resultatet, da det normalt ikke vælges
      .addSelect('user.user_password')

      // where() bruges til at filtrere brugeren baseret på email
      .where('user.user_email = :email', {
        email: logInDto.email,
      })

      // getOne() bruges til at hente en enkelt bruger, hvis den findes
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Forkert email eller adgangskode');
    }

    // Sammenlign password med hash i databasen
    const isPasswordValid = await this.passwordService.comparePassword(
      logInDto.password,
      user.user_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Forkert email eller adgangskode');
    }

    return {
      message: 'Login succesfuldt',
      // sub er det felt, JwtAuthGuard læser bruger-id'et fra
      access_token: await this.jwtService.signAsync({ sub: user.user_pk }),
      user_pk: user.user_pk,
      user_role: user.user_role,
    };
  }
}
