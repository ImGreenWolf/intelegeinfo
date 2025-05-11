#include <iostream>

using namespace std;

 //Căutăm numerele prime până la 1000

int main()
{
    int ciur[101]={0};
     int v[100]={0};
    for(int i = 2; i <= 100; i++) {
        if(ciur[i] == 0) { //Am găsit un număr nemarcat (prim)
            //Marcăm multiplii lui i
            for(int j = 2 * i; j <= 100; j += i) {
                ciur[j] = 1;
            }
        }
    }aaaaa

    //Afișăm pe ecran toate numerele prime găsite
    for(int i = 2; i <= 100; i++) {
        if(ciur[i] == 0) {
            cout << "Numarul " << i << " este prim\n";
        }
    }
    return 0;
}