import mongoose, {Schema, Document} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { env } from "../env.js";


interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isEmailVerfied: boolean;
  refreshToken?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}


const userSchema = new Schema<IUser>({

    name:{
        type: String,
        required: true,
        trim: true
    },

    email:{
        type: String,
        required: true,
        unique: true,
    },

    password:{
        type: String,
        required: true,
        trim: true
    },

    isEmailVerfied:{
        type: Boolean,
        default: false
    },

    refreshToken:{
        type: String,
    }


}, {timestamps: true})

userSchema.pre("save", async function(){

  if(!this.isModified("password")){
    return;
  }

  this.password = await bcrypt.hash(this.password, 10)

})

userSchema.methods.isPasswordCorrect = async function(password:string){

  return await bcrypt.compare(password, this.password)

}


userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
    id: this._id,
    email: this.email,
  }, env.ACCESS_TOKEN_CODE, {expiresIn: '15min'})
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
    id: this._id,
  }, env.REFRESH_TOKEN_CODE, {expiresIn: '10d'})
}

export const User = mongoose.model("User", userSchema)