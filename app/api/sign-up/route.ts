// import dbConnect from '@/lib/dbConnect';
// import UserModel from '@/model/User';
// import bcrypt from 'bcryptjs';
// import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

// export async function POST(request: Request) {
//   await dbConnect();

//   try {
//     const { username, email, password } = await request.json();

//     const existingVerifiedUserByUsername = await UserModel.findOne({
//       username,
//       isVerified: true,
//     });

//     if (existingVerifiedUserByUsername) {
//       return Response.json(
//         {
//           success: false,
//           message: 'Username is already taken',
//         },
//         { status: 400 }
//       );
//     }

//     const existingUserByEmail = await UserModel.findOne({ email });
//     let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

//     if (existingUserByEmail) {
//       if (existingUserByEmail.isVerified) {
//         return Response.json(
//           {
//             success: false,
//             message: 'User already exists with this email',
//           },
//           { status: 400 }
//         );
//       } else {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         existingUserByEmail.password = hashedPassword;
//         existingUserByEmail.verifyCode = verifyCode;
//         existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
//         await existingUserByEmail.save();
//       }
//     } else {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const expiryDate = new Date();
//       expiryDate.setHours(expiryDate.getHours() + 1);

//       const newUser = new UserModel({
//         username,
//         email,
//         password: hashedPassword,
//         verifyCode,
//         verifyCodeExpiry: expiryDate,
//         isVerified: false,
//         isAcceptingMessages: true,
//         messages: [],
//       });

//       await newUser.save();
//     }

//     // Send verification email
//     const emailResponse = await sendVerificationEmail(
//       email,
//       username,
//       verifyCode
//     );
//     if (!emailResponse.success) {
//       return Response.json(
//         {
//           success: false,
//           message: emailResponse.message,
//         },
//         { status: 500 }
//       );
//     }

//     return Response.json(
//       {
//         success: true,
//         message: 'User registered successfully. Please verify your account.',
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Error registering user:', error);
//     return Response.json(
//       {
//         success: false,
//         message: 'Error registering user',
//       },
//       { status: 500 }
//     );
//   }
// }





// import dbConnect from '@/lib/dbConnect';
// import UserModel from '@/model/User';
// import bcrypt from 'bcryptjs';
// import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

// export async function POST(request: Request) {
//   await dbConnect();

//   try {
//     const body = await request.json();
//     console.log('Received request body:', body); // Add this line

//     const { username, email, password, role } = body;
//     console.log('Destructured data:', { username, email, role }); // Add this line

//     const validRole = role && ['admin', 'organizer', 'viewer'].includes(role)
//       ? role
//       : 'viewer';

//     console.log('Using role:', validRole);


//     const existingVerifiedUserByUsername = await UserModel.findOne({
//       username,
//       isVerified: true,
//     });

//     if (existingVerifiedUserByUsername) {
//       return Response.json(
//         {
//           success: false,
//           message: 'Username is already taken',
//         },
//         { status: 400 }
//       );
//     }

//     const existingUserByEmail = await UserModel.findOne({ email });
//     let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

//     if (existingUserByEmail) {
//       if (existingUserByEmail.isVerified) {
//         return Response.json(
//           {
//             success: false,
//             message: 'User already exists with this email',
//           },
//           { status: 400 }
//         );
//       } else {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         existingUserByEmail.password = hashedPassword;
//         existingUserByEmail.verifyCode = verifyCode;
//         existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
//         existingUserByEmail.role = role;
//         console.log('Updating existing user with role:', role); // Add this line
//         await existingUserByEmail.save();
//       }
//     } else {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const expiryDate = new Date();
//       expiryDate.setHours(expiryDate.getHours() + 1);

//       const userData = {
//         username,
//         email,
//         password: hashedPassword,
//         verifyCode,
//         verifyCodeExpiry: expiryDate,
//         isVerified: false,
//         isAcceptingMessages: true,
//         role: validRole || 'viewer',
//         messages: [],
//       };
//       console.log('Creating new user with data:', userData); // Add this line

//       const newUser = new UserModel(userData);
//       await newUser.save();

//       console.log('Saved user:', newUser.toObject()); // Add this line
//     }

//     // Send verification email
//     const emailResponse = await sendVerificationEmail(
//       email,
//       username,
//       verifyCode
//     );
//     if (!emailResponse.success) {
//       return Response.json(
//         {
//           success: false,
//           message: emailResponse.message,
//         },
//         { status: 500 }
//       );
//     }

//     return Response.json(
//       {
//         success: true,
//         message: 'User registered successfully. Please verify your account.',
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Error registering user:', error);
//     return Response.json(
//       {
//         success: false,
//         message: 'Error registering user',
//       },
//       { status: 500 }
//     );
//   }
// }

import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { username, email, password, role = 'viewer' } = body;

    // Validate role
    if (!['admin', 'organizer', 'viewer'].includes(role)) {
      return Response.json(
        {
          success: false,
          message: 'Invalid role specified',
        },
        { status: 400 }
      );
    }

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = expiryDate;
        existingUserByEmail.role = role;
        await existingUserByEmail.save();
        console.log('Updated user:', existingUserByEmail.toObject());
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        role,
        messages: [],
      });

      const savedUser = await newUser.save();
      console.log('Created new user:', savedUser.toObject());
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
  }
}