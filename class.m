clc;
clear all;
close all;

t=0:0.1:1;
n=length(t);
p1=[2,1];
p2=[1,2];
p=t*p1+(1-t)*p2;
plot(p(:,1),p(:,2),'*');