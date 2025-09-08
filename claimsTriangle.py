import math
import pandas as pd
import datetime as dt

"""
Class claimTriangle (non comprehensive list)

1. Incurred Date (int, mmddyyyy): date on which a claim was incurred
2. Paid Date (int, mmddyyyy): date on which a claim was paid 
3. Delimiter (string: can have multiple for non-credible products i.e. "MA1,MA2" would create a claims triangle for both MA1 and MA2 claims combined): a string delimiter to separate claims into reserving "buckets". In effect, each delimiter would have its own claims triangle
4. Paid Amount (money: a decimal rounded to closest cent on input): the amount paid out
"""

class claimTriangle():

    def __init__(self, 
                 df: pd.DataFrame = None, 
                 **triangleConfig: dict['columnNames':dict['incurDate':None,
                                                           'paidDate':None,
                                                           'delimiter':None,
                                                           'paidAmount': None],
                                        'maxLag':None,
                                        'calcMethod':'12-0:12+0',
                                        'delimiter':[None],
                                        'filePath':'',
                                        'fileType':'']
                    ) -> dict: 

        if df == None:
            self._load_filePath()
        else:
            self._load()
        
        self._errorCheck()

        if self.triangleConfig['delimiter'] == None:
            for item in df['delim'].unique():
                self._createTriangle(self)
        else:
            for item in self.triangleConfig['delimiter']:
                self._modCreateTriangle(self)

    def _errorCheck(self) -> None:
        pass # Placeholder

    def _load(self) -> None:
        pass # Placeholder

    def _load_filePath(self) -> None:
        pass # Placeholder

    def _createTriangle(self):
        pass # Placeholder

    def _modCreateTriangle(self):
        pass # Placeholder

            