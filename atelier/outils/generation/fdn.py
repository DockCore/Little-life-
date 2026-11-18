import os as _o;A=globals().get('A') or _o.path.dirname(_o.path.dirname(_o.path.abspath(__file__)))  # A = atelier/outils
exec(open(A+'/generation/z.py').read())
def ch(a,z,y,x):
    if a[y,x,3]==0:return ' '
    l=.3*a[y,x,0]+.59*a[y,x,1]+.11*a[y,x,2]
    if l<56:return '#'
    r,g,b=a[y,x,:3]
    if r>200 and g>200 and b>190:return 'w'
    if z[y,x]==2:return 'h'
    if b>r:return 'b'
    return 's' if r>g+25 else 'g'
def maps(ks,y0=74,y1=102,x0=18,x1=52):
    A=[(img(SPA[k]).astype(int),Z(k)) for k in ks]
    print('    '+'   '.join(''.join(str(x%10) for x in range(x0,x1)) for _ in ks))
    for y in range(y0,y1):print('%3d '%y+'   '.join(''.join(ch(a,z,y,x) for x in range(x0,x1)) for a,z in A))
