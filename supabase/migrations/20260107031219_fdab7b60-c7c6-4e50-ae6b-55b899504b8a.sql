-- Allow staff (employees and admins) to view all profiles for assignment purposes
CREATE POLICY "Staff can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'employee'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow staff to view all user roles for assignment purposes
CREATE POLICY "Staff can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'employee'::app_role) OR has_role(auth.uid(), 'admin'::app_role));