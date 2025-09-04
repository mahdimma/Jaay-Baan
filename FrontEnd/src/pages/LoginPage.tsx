import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "../hooks/useApi";
import { Button, Input, Icon } from "../components/ui";

const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Icon name="layers" className="text-primary-600" size={48} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            جای بان
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            سامانه مدیریت ذخیره‌سازی اشیاء فیزیکی
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="نام کاربری"
              type="text"
              {...register("username")}
              error={errors.username?.message}
              placeholder="نام کاربری خود را وارد کنید"
            />

            <Input
              label="رمز عبور"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              placeholder="رمز عبور خود را وارد کنید"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              ورود
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
